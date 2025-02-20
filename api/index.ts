import App from 'koa'
import Router from 'koa-router';
import server from "./app/server";
import dotenv from 'dotenv';
import consola, {Consola, FancyReporter} from 'consola';
import cors from '@koa/cors';

consola.setReporters([
  new FancyReporter({
    dateFormat: 'YYYY:MM:DD HH:mm:ss'
  }),
]);
consola.wrapConsole();
const logger = consola.withTag('app');

dotenv.config({ path: __dirname + '/.env.template' });
dotenv.config({ path: __dirname + '/.env', override: true });

export interface ContextExtends extends App.DefaultContext {
  logger: Consola
}

const app = new App<App.DefaultState, ContextExtends>({
  proxy: true
})

// Enable logs.
app.use(async (ctx, next) => {
  ctx.logger = logger
  await next()
})

// Enable CORS.
app.use(cors({origin: '*'}))

// Init router.
const router = new Router<App.DefaultState, ContextExtends>()
server(router)
app.use(router.routes()).use(router.allowedMethods())

const port = parseInt(process.env.SERVER_PORT || '3450')
app.listen(port, () => {
  logger.info(`start at ${port}`)
})

process.on("unhandledRejection", function(reason, p){
  console.log("Unhandled", reason, p); // log all your errors, "unsuppressing" them.
  throw reason; // optional, in case you want to treat these as errors
});
