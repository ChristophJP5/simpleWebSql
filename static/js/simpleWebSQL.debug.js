if (typeof DBNAME != "undefined") {
    var _db = openDatabase(DBNAME, '1.0', 'Database designed generated By ChristophJP', 2 * 1024 * 1024);
    var db = {
        fetchAll: function (statement, where, callback) {
            //console.log(statement, where, callback);
            this.fetch(statement, "all", where, callback);
        },
        fetchOne: function (statement, where, callback) {
            //console.log(statement, where, callback);
            this.fetch(statement, "one", where, callback);
        },
        fetchRow: function (statement, where, callback) {
            //console.log(statement, where, callback);
            this.fetch(statement, "row", where, callback);
        },
        fetchArray: function (statement, where, callback) {
            //console.log(statement, where, callback);
            this.fetch(statement, "array", where, callback);
        },
        fetch: function (statement, type, where, callback) {
            _db.transaction(function (tx) {
                if (type == "row" || type == "one") {
                    if (statement.indexOf("LIMIT ") == -1) {
                        statement += " LIMIT 1";
                    }
                }
                console.log(statement, where);
                tx.executeSql(statement, where, function (data, result) {
                    console.log(data);
                    switch (type) {
                        case "array":
                            result = result.rows;
                            keys = Object.keys(result);
                            value = [];
                            for (a = 0; a < keys.length; a++) {
                                row = result[a];
                                rowKeys = Object.keys(row);
                                for(b=0; b< rowKeys.length; b++){
                                    value.push(row[rowKeys[b]]);
                                }
                            }
                            break;
                        case "row":
                            value = result.rows[0]
                            break;
                        case "one":
                            result = result.rows[0]
                            keys = Object.keys(result);
                            value = result[keys[0]]
                            break;
                        case "all":
                            value = result.rows
                            break;
                    }
                    callback(value);
                });
            })
        },
        execute: function (statement, data) {
            console.log(statement, data);
            _db.transaction(function (tx) {
                if (data) {
                    tx.executeSql(statement, data);
                } else {
                    tx.executeSql(statement);
                }
            })
        },
        delete: function (tableName, where, limit) {
            statement = "DELETE FROM " + tableName + " WHERE ";
            prepareArray = [];
            whereKeys = Object.keys(where);
            for (a = 0; a < whereKeys.length; a++) {
                whereKey = whereKeys[a];
                if (a > 0) {
                    statement += " AND "
                }
                statement += whereKey + " = ?"
                prepareArray.push(where[whereKey])
            }
            if (limit) {
                statement += " LIMIT " + limit;
            }
            _db.transaction(function (tx) {
                console.log(statement, prepareArray);
                tx.executeSql(statement, prepareArray);
            })
        },
        update: function (tableName, data, where) {
            me = this;
            if (Array.isArray(data)) {
                for (e = 0; e < data.length; e++) {
                    updateFunction(data[e], where[e]);
                }
            } else {
                updateFunction(data, where);
            }
            function updateFunction(data, where) {
                statement = "UPDATE " + tableName + " SET ";
                dataKeys = Object.keys(data);
                setString = whereString = ""
                prepareArray = [];
                for (a = 0; a < dataKeys.length; a++) {
                    dataKey = dataKeys[a];
                    setString += dataKey + " = ?, "
                    prepareArray.push(data[dataKey])
                }
                statement += setString.substr(0, setString.length - 2);
                whereKeys = Object.keys(where);
                if (whereKeys.length > 0) {
                    statement += " WHERE ";
                    for (a = 0; a < whereKeys.length; a++) {
                        whereKey = whereKeys[a];
                        if (a > 0) {
                            statement += " AND "
                        }
                        statement += whereKey + " = ?"
                        prepareArray.push(where[whereKey])
                    }
                }
                console.log(statement, prepareArray);
                db.execute(statement, prepareArray);
                return true;
            }
        },
        turncate: function (tables) {
            for (a = 0; a < tables.length; a++) {
                statement = "TURNCATE TABLE " + tables[a];
                _db.transaction(function (tx) {
                    console.log(statement);
                    tx.executeSql(statement);
                })
            }
        },
        insert: function (tableName, inserts, type) {
            insertKeys = Object.keys(inserts);
            for (a = 0; a < insertKeys.length; a++) {
                insertKey = insertKeys[a];
                insertQuery = prepareQuery = '(';
                if (!type) {
                    query = 'INSERT INTO '
                } else {
                    if (type == "replace") {
                        query = 'REPLACE INTO ';
                    } else {
                        query = 'INSERT IGNORE INTO ';
                    }
                }
                query += tableName + ' ';
                colums = inserts[insertKey];
                columNames = Object.keys(colums)
                columValues = []
                for (b = 0; b < columNames.length; b++) {
                    columName = columNames[b];
                    insertQuery += columName + ", ";
                    prepareQuery += "?, ";
                    columKeys = Object.keys(colums);
                    if (columKeys.length < 2) {
                        columValues = colums[columName];
                    } else {
                        for (d = 0; d < columKeys.length; d++) {
                            columValues[d] = colums[columKeys[d]];
                        }
                        columValues = [columValues];
                    }
                }
                insertQuery = insertQuery.substr(0, insertQuery.length - 2) + ")";
                prepareQuery = prepareQuery.substr(0, prepareQuery.length - 2) + ")";
                query += insertQuery + " VALUES" + prepareQuery
                //console.log(query, columValues);
                if (typeof columValues == "object") {
                    if (columValues.length > 1) {
                        for (c = 0; c < columValues.length; c++) {
                            this.execute(query, [columValues[c]]);
                        }
                    } else {
                        for (c = 0; c < columValues.length; c++) {
                            this.execute(query, columValues[c]);
                        }
                    }
                } else {
                    this.execute(query, [columValues])
                }
            }
        },
        create: function (obj) {
            tablenames = Object.keys(obj);
            for (a = 0; a < tablenames.length; a++) {
                tableName = tablenames[a];
                query = 'CREATE TABLE IF NOT EXISTS '
                query += tableName + ' (';
                settings = obj[tableName];
                if (typeof settings == "object") {
                    colums = Object.keys(settings)
                    for (b = 0; b < colums.length; b++) {
                        colname = colums[b];
                        query += colname + " ";
                        columSettings = settings[colname];
                        for (c = 0; c < columSettings.length; c++) {a
                            query += columSettings[c] + " ";
                        }
                        query = query.substr(0, query.length - 1) + ", ";
                    }
                }
                statement = query.substr(0, query.length - 2) + ")".toString();
                //console.log(statement)
                this.execute(statement);
            }
        },
        dropTables: function (obj) {
            tablenames = Object.keys(obj);
            for (a = 0; a < tablenames.length; a++) {
                tableName = tablenames[a];
                this.execute('DROP TABLE ' + tableName);
            }
        }
    }
} else {
    alert('"DBNAME" nicht definiert');
}