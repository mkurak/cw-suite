# @cw-suite/api-db-typeorm

TypeORM DataSource yaşam döngüsünü yöneten yardımcılar. Config değişikliklerini güvenli şekilde uygular, otomatik initialisation, migration koşturma ve DI entegrasyonu sunar.

## Öne Çıkanlar
- **Deterministik DataSource yönetimi** – tek `TypeOrmManager` örneği bağlantıyı yönetir, yeniden yapılandırmada eski DataSource temizlenir.
- **Lazy veya eager init** – `autoInitialize` ve `ensureInitialized()` ile kontrol sizde.
- **Migration yardımcıları** – `runMigrations` ve `revertLastMigration` varsayılan olarak transaction modunu yönetir.
- **DI modülü** – `typeOrmModule` ve `useTypeOrm` ile container paylaşımı sağlar.
- **Konfigürasyon esnekliği** – `dataSource` opsiyonu factory veya ham `DataSourceOptions` olarak verilebilir, `dataSourceFactory` ile custom bağlantı oluşturma.

## Kurulum

```bash
npm install @cw-suite/api-db-typeorm typeorm
```

## Hızlı Başlangıç

```ts
import { TypeOrmManager } from '@cw-suite/api-db-typeorm';

const manager = new TypeOrmManager();

manager.configure({
  dataSource: () => ({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: ['dist/entities/*.js'],
    migrations: ['dist/migrations/*.js']
  }),
  autoInitialize: true,
  runMigrationsOnInit: true
});

await manager.ensureInitialized();
```

## Konfigürasyon Seçenekleri
| Alan | Açıklama |
| --- | --- |
| `dataSource` | `DataSourceOptions` veya async/sync factory döndüren fonksiyon. |
| `dataSourceFactory` | `new DataSource(options)` yerine özel DataSource üretmek için. |
| `autoInitialize` | `configure` çağrısından sonra otomatik `ensureInitialized`. |
| `runMigrationsOnInit` | İlk initialize sonrasında pending migration'ları çalıştırır. |
| `migrationsTransaction` | Migration komutlarında kullanılacak transaction modu (`'all' | 'each' | 'none'`). |
| `onInitialized` | DataSource hazır olduğunda çalışır (health check, seed vb.). |
| `allowReconfigure` | Aynı manager'a tekrar `configure` etmenize izin verir. |

## Kullanışlı Metodlar
- `ensureInitialized()` – DataSource hazır değilse oluşturur ve cache'ler.
- `getDataSource()` / `getDataSourceOrFail()` – asenkron veya senkron erişim.
- `runMigrations(options?)` – `transaction` ayarı opsiyoneldir, default configteki değer kullanılır.
- `revertLastMigration(options?)` – son migration'ı geri sarar.
- `destroy()` – DataSource'u kapatır ve yeniden kullanılabilir hale getirir.

## DI ile Kullanım

```ts
import { useTypeOrm } from '@cw-suite/api-db-typeorm';
import { Container } from '@cw-suite/api-di';

const container = new Container();

const manager = await useTypeOrm({
  container,
  config: {
    dataSource: async () => ({
      type: 'sqlite',
      database: ':memory:',
      entities: [User],
      synchronize: true
    }),
    autoInitialize: true
  }
});

const dataSource = await manager.getDataSource();
```

- `useTypeOrm({ configure })` ile ekstra ayarlar uygulayabilir, `autoInitialize` bayrağı ile ilk tetiklemeyi garantileyebilirsiniz.
- `typeOrmModule` modülünü doğrudan `registerModules(container, typeOrmModule)` çağrısı ile de eklemek mümkündür.

## Script ve Migration Akışı
```bash
# Yeni migration oluşturma
pnpm typeorm migration:generate ./src/migrations/CreateUsers

# Manager üzerinden migration çalıştırma
node -e "require('@cw-suite/api-db-typeorm').useTypeOrm({ config: { dataSource: require('./ormconfig') } }).then(m => m.runMigrations())"
```

## Yardımcı Fonksiyon
- `createManagedDataSource(config)` – override edilmeye uygun `TypeOrmManager` oluşturup DataSource döner. CLI veya testlerde hızlı kullanım için.

README yenileme maddesi tamamlandığında `docs/TODO.md` üzerindeki ilgili kutucuk işaretlenmelidir.
