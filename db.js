let db;

async function initDB() {
    try {
        const config = { locateFile: filename => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${filename}` };
        const SQL = await initSqlJs(config);
        const savedData = localStorage.getItem('datenbank_blob');
        if (savedData) {
            db = new SQL.Database(Uint8Array.from(atob(savedData), c => c.charCodeAt(0)));
        } else {
            db = new SQL.Database();
            db.run("CREATE TABLE Listen (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, attrs TEXT);");
            db.run("CREATE TABLE Produkte (id INTEGER PRIMARY KEY AUTOINCREMENT, liste_id INTEGER, barcode TEXT, data TEXT);");
            saveToLocalStorage();
        }
    } catch (err) { console.error("Fehler beim Start:", err); }
}

function saveToLocalStorage() {
    if (!db) return;
    const data = db.export();
    const binaryString = String.fromCharCode.apply(null, data);
    localStorage.setItem('datenbank_blob', btoa(binaryString));
}

// Hier ist der entscheidende Punkt:
function dbQuery(sql, params = []) {
    if (!db) return [];
    try {
        // .run für Inserts/Deletes, .exec für Selects
        if (sql.trim().toUpperCase().startsWith("SELECT")) {
            return db.exec(sql, params);
        } else {
            db.run(sql, params);
            saveToLocalStorage();
            return [];
        }
    } catch (e) {
        console.error("SQL Fehler:", e);
        return [];
    }
}