/* eslint-disable @typescript-eslint/no-explicit-any */
interface Window {
  google?: {
    maps: {
      Map: new (el: HTMLElement, opts: any) => any;
      Marker: new (opts: any) => any;
      SymbolPath: {
        CIRCLE: any;
      };
    };
  };
}
