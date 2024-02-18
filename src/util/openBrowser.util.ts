const  openBrowser = (filePath: string) => {
    try {
        const url = `file://${__dirname}/../../${filePath}`
        require('child_process').exec(`open ${url}`)
    } catch (error) {
        console.error('Failed to open the browser:', error)
    }
}

export default openBrowser
