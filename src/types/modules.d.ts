// Type declarations for CSS modules and inline imports

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.scss?inline' {
  const content: string;
  export default content;
}

declare module '*.scss?raw' {
  const content: string;
  export default content;
}

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.css?inline' {
  const content: string;
  export default content;
}

declare module '*.css?raw' {
  const content: string;
  export default content;
}

declare module '*.module.sass' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.sass?inline' {
  const content: string;
  export default content;
}

declare module '*.sass?raw' {
  const content: string;
  export default content;
}

declare module '*.svg?inline' {
  const content: string;
  export default content;
}

declare module '*.svg?raw' {
  const content: string;
  export default content;
}
