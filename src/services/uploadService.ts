// services/uploadService.ts

export const uploadService = {
  /**
   * Converte um arquivo em Base64
   * @param file File
   * @returns Promise<string> Base64 do arquivo
   */
  upload: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
    });
  },
};
