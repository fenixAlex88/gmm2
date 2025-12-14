// helpers/uploadFiles.ts (создайте этот файл)

// Принимает список файлов, возвращает Promise с массивом URL
export async function uploadFiles(files: FileList): Promise<string[]> {
	const uploadPromises: Promise<string>[] = [];

	Array.from(files).forEach((file) => {
		const formData = new FormData();
		formData.append("file", file);

		const uploadPromise = fetch("/api/admin/upload", { // Укажите правильный путь, если он отличается
			method: "POST",
			body: formData,
		})
			.then(res => {
				if (!res.ok) {
					throw new Error(`Ошибка загрузки: ${res.statusText}`);
				}
				return res.json();
			})
			.then(data => data.url as string); // Ожидаем, что Route Handler вернет { url: "..." }

		uploadPromises.push(uploadPromise);
	});

	// Ожидаем выполнения всех промисов
	const results = await Promise.all(uploadPromises);
	return results;
}