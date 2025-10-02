# @cw-suite/api-di

cw API ekosisteminin tüm paketlerini taşıyan lightweight IoC konteyneri. Dekoratör destekli kayıtlar, öngörülebilir yaşam döngüsü, isteğe bağlı modül sistemi ve kapsam (scope) temelli çözümleme özellikleri sunar.

## Öne Çıkanlar
- **TypeScript-first** – `@Injectable`, `@Inject`, `@Optional` decorators ve tip güvenli tokenlar.
- **Yaşam döngüleri** – `Singleton`, `Scoped`, `Transient` servisler; `runInScope` ile istek/iş kapsamı.
- **Modül sistemi** – `createModule` + `registerModules` ile paket düzeyinde DI konfigürasyonu paylaşın.
- **Meta veri** – Controller/Route ve middleware dekoratörleri ile HTTP katmanı için discovery verisi üretir.
- **Gözlemlenebilirlik** – Çözümleme ve dispose olaylarını dinleyin, `enableEventLogging` ile loglayın.

## Kurulum

```bash
npm install @cw-suite/api-di
```

> TypeScript projelerinde `experimentalDecorators` ve `emitDecoratorMetadata` seçeneklerini etkinleştirmeyi unutmayın.

## Hızlı Başlangıç

```ts
import {
  Container,
  Injectable,
  Inject,
  Lifecycle,
  createModule,
  registerModules
} from '@cw-suite/api-di';

@Injectable()
class ConfigService {
  readonly port = Number(process.env.PORT ?? 3000);
}

@Injectable({ lifecycle: Lifecycle.Scoped })
class RequestIdProvider {
  private readonly id = crypto.randomUUID();
  get value() {
    return this.id;
  }
}

@Injectable()
class UserService {
  constructor(private readonly config: ConfigService) {}
  find(id: string) {
    return { id, port: this.config.port };
  }
}

const appModule = createModule({
  providers: [ConfigService, RequestIdProvider, UserService]
});

const container = new Container();
registerModules(container, appModule);

container.runInScope('http', () => {
  const users = container.resolve(UserService);
  console.log(users.find('42'));
});
```

## Yaşam Döngüsü & Scoped Çözümleme
- Varsayılan yaşam döngüsü `Singleton`dır.
- `Lifecycle.Transient` seçtiğinizde her `resolve` yeni örnek döndürür.
- `Lifecycle.Scoped`, `runInScope`/`runInSession` çağrısı sırasında cache'lenir, kapsam bittiğinde dispose edilir.
- `container.destroySession(sessionId)` veya scope sonu otomatik dispose tetikler; async `dispose()` metodları beklenecektir.
- `container.createChild({ include, exclude })` ile hiyerarşik konteynerler tanımlayıp seçili kayıtları devralabilirsiniz.

## Modül Sistemi
- `createModule({ providers, exports, imports })` paket bazlı DI yapılandırması üretir.
- `registerModules(container, moduleA, moduleB)` tekrar kayıt etmeyi engeller ve bağımlı modülleri sırayla yükler.
- Provider tanımları doğrudan sınıf referansı veya `{ provide, useClass, options }` yapısı ile tanımlanır; `options.lifecycle` ile yaşam döngüsü atanır.

### Global konteyner yardımcıları
- `getContainer()` – lazy singleton konteyner döndürür; paketler arası paylaşım için idealdir.
- `resetContainer()` – testler arasında global konteyneri sıfırlamak için kullanılır.

## Dekoratörler ve Metadata
- `@Injectable({ lifecycle, name, type })`
- `@Inject(token)` ve `@Optional()` – constructor veya property injection.
- `@Controller`, `@Route` – HTTP adaptörleri için yol/method metadata üretir.
- `@UseMiddleware`, `@RouteMiddleware`, `@GlobalMiddleware` – middleware tanımları.
- `@ForwardRefInject` ve `forwardRef(() => Class)` – döngüsel bağımlılıkları çözmek için.
- Metadata yardımcıları: `getControllerRoutes`, `getMiddlewareMetadata`, `getActionMiddlewares` vb.

## Gözlemlenebilirlik
- `container.on(event, listener)` ile `resolve:start|success|error`, `instantiate`, `dispose`, `stats:change` olaylarını izleyin.
- `container.enableEventLogging({ includeSuccess, includeDispose, sink })` hızlı loglama sağlar.
- `container.getStats()` kayıt, singleton sayısı ve aktif scope bilgilerini verir.

## Discovery Yardımcıları
- `discover({ container, modules, filter })` dosya sistemi tabanlı olmayan, dekorasyon temelli servis keşfi için kullanılır.
- Dönüş değeri, bağlanan provider'ların listesiyle birlikte metadata içerir; CLI veya bootstrap aşamasında faydalıdır.

## API Özeti
- `Container` sınıfı (`register`, `resolve`, `runInScope`, `runInSession`, `createChild`, `on`, `clear` ...)
- Dekoratörler: `Injectable`, `Inject`, `Optional`, `ForwardRefInject`, `Controller`, `Route`, `UseMiddleware`, `RouteMiddleware`, `GlobalMiddleware`
- Modül yardımcıları: `createModule`, `registerModules`
- Helper’lar: `getContainer`, `resetContainer`, `discover`, `forwardRef`
- Tipler: `Lifecycle`, `ServiceType`, `ResolveOptions`, `ChildContainerOptions`, `ContainerStats`, `ContainerEventName`

README yenileme maddesi tamamlandığında `docs/TODO.md` üzerindeki ilgili kutucuk işaretlenmelidir.
