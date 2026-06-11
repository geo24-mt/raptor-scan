// db.js
let db;

async function initDB() {
    try {
        const config = { locateFile: filename => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${filename}` };
        // Wir nutzen den globalen SQL-Zugriff
        const SQL = await initSqlJs(config);

        const savedData = localStorage.getItem('datenbank_blob');
        if (savedData) {
            db = new SQL.Database(Uint8Array.from(atob(savedData), c => c.charCodeAt(0)));
            console.log("DB geladen aus Speicher.");
        } else {
            db = new SQL.Database();
            db.run("CREATE TABLE Listen (id INTEGER PRIMARY KEY, name TEXT, attrs TEXT);");
            db.run("CREATE TABLE Produkte (id INTEGER PRIMARY KEY, liste_id INTEGER, barcode TEXT, data TEXT);");
            saveToLocalStorage();
            console.log("Neue DB erstellt.");
        }
    } catch (err) {
        console.error("DB konnte nicht starten:", err);
    }
}

function saveToLocalStorage() {
    if (!db) return;
    const data = db.export();
    const binaryString = String.fromCharCode.apply(null, data);
    localStorage.setItem('datenbank_blob', btoa(binaryString));
}

function dbQuery(sql, params = []) {
    if (!db) { console.error("DB nicht initialisiert!"); return []; }
    const result = db.exec(sql, params);
    saveToLocalStorage();
    return result;
}