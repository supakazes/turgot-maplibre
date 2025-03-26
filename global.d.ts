// handle models as assets
declare module "*.glb" {
  const content: string;
  export default content;
}

// Add JPG/JPEG support
declare module "*.jpg" {
  const content: string;
  export default content;
}

declare module "*.jpeg" {
  const content: string;
  export default content;
}
