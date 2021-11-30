interface App {
  start(this: void, params: { width: number; height: number }): void;
  update(this: void): void;
  leave(this: void): void;
}

export default App;
