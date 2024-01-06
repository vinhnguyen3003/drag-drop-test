export const importJson = (e: React.ChangeEvent<HTMLInputElement>, callback: (json: string) => void) => {
    const files = e.target.files
    if (!files?.length) return

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        const jsonData = e.target?.result?.toString() || ''
        if (jsonData) callback(jsonData)
    };
    reader.readAsText(file);
}

export const exportJson = (jsonStr: string, customFilename?: string) => {
    if (!jsonStr) return
    const filename = customFilename || 'data.json';
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(jsonStr));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}