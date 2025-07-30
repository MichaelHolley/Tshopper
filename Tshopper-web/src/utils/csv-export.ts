const createCsvContent = (data: Object[]) => {
  const headers = Object.keys(data[0]).join(';')
  const rows = data.map((row) => Object.values(row).join(';'))
  return [headers, ...rows].join('\n')
}

const downloadCsv = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
}

export const exportToCsvFile = (data: Object[], filename: string) => {
  downloadCsv(createCsvContent(data), filename)
}
