export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      type?: 'dev' | 'prod';
    }
  }
}
