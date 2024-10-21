// counter MVC en Typescript

// MODEL
class Count {
  constructor(private count: number = 0) {}
  get() {
    return this.count;
  }
  increment() {
    this.count += 1;
  }
  decrement() {
    if (this.count > 0) this.count -= 1;
  }
}

// CONTROLLER
class Controller {
  constructor(private model: Count, private view: View) {}
  get() {
    this.view.render(this.model.get());
  }
  increment() {
    this.model.increment();
    this.view.render(this.model.get());
  }
  decrement() {
    this.model.decrement();
    this.view.render(this.model.get());
  }
}

// View
interface View {
  render(val: number): void;
}
class LoggerView implements View {
  render(val: number): void {
    console.log(val);
  }
}

// Usage
const main = new Controller(new Count(), new LoggerView());
console.log("ON");
main.get();
main.increment();
main.increment();
main.decrement();
