export function filePathToKey(filepath: string): string {
  const filename = filepath.replace(/^.*[\\/]/, "");
  return filename.replace(/\.ts$/i, "");
}
