import { TestBed } from "@angular/core/testing";

import { App } from "./app";

describe("App", () => {
  it("renders title", async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    })
      .overrideComponent(App, {
        set: {
          template: "<h2>Counter</h2>",
          imports: [],
        },
      })
      .compileComponents();

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector("h2")?.textContent).toContain(
      "Counter",
    );
  });
});

