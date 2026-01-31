export function convertBlobToUrl(blob: Blob, onSuccess: (dataUrl: string) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const dataUrl = reader.result as string;
      onSuccess(dataUrl);
      resolve();
    };

    reader.onerror = () => {
      reject(new Error('Не вдалося обробити PDF файл'));
    };

    reader.readAsDataURL(blob);
  });
}
