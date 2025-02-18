import {
  CacheModule, Module,
} from '@nestjs/common';
import { InMemoryCacheService } from './in-memory-cache.service';

@Module({
  imports: [
    CacheModule.register({
      store: 'memory',
      shouldCloneBeforeSet: false,
    }),
  ],
  exports: [
    InMemoryCacheService,
  ],
  providers: [
    InMemoryCacheService,
  ],
})
export class InMemoryCacheModule { }
