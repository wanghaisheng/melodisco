const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'models');

function convertSqlToPrisma(sql) {
    // Extract table name and columns
    const match = sql.match(/INSERT INTO (\w+)\s*\(([\s\S]+?)\)\s*VALUES/);
    if (!match) return sql;

    const [, tableName, columnsString] = match;
    const columns = columnsString.split(',').map(col => col.trim());

    // Create Prisma query
    const prismaQuery = `prisma.${tableName}.create({
    data: {
      ${columns.map(col => `${col}: ${col}`).join(',\n      ')}
    }
  })`;

    return prismaQuery;
}

function convertFile(filePath) {
    console.log(`Converting file: ${filePath}`);
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove old imports
    content = content.replace(/import { QueryResult, QueryResultRow } from "pg";/, '');

    // Add Prisma import if not already present
    if (!content.includes('@prisma/client')) {
        content = `import { Prisma } from "@prisma/client";\n${content}`;
    }

    // Replace db.query calls
    content = content.replace(/db\.query\(/g, 'prisma.');

    // Update function signatures
    content = content.replace(/Promise<QueryResult>/g, 'Promise<Prisma.PrismaPromise<any>>');

    // Replace res.rows with direct results
    content = content.replace(/const { rows } = res;/g, '');
    content = content.replace(/res\.rows/g, 'res');

    // Update result handling
    content = content.replace(/if \(res\.rowCount === 0\)/g, 'if (!res || res.length === 0)');

    // Update formatSong function signature (if present)
    content = content.replace(/formatSong\(row: QueryResultRow\)/, 'formatSong(row: any)');

    // Convert SQL queries to Prisma queries
    content = content.replace(/`INSERT INTO[\s\S]+?VALUES[\s\S]+?`/g, convertSqlToPrisma);
    
    // Replace SELECT queries
    content = content.replace(/`SELECT \* FROM (\w+)`/g, (match, table) => `prisma.${table}.findMany()`);
    content = content.replace(/`SELECT \* FROM (\w+) WHERE (.+)`/g, (match, table, condition) => 
        `prisma.${table}.findMany({ where: { ${condition.replace(/=/g, ':')} } })`
    );

    // Replace UPDATE queries
    content = content.replace(/`UPDATE (\w+) SET (.+) WHERE (.+)`/g, (match, table, setClause, whereClause) => 
        `prisma.${table}.update({ 
            where: { ${whereClause.replace(/=/g, ':')} },
            data: { ${setClause.replace(/=/g, ':')} }
        })`
    );

    // Replace DELETE queries
    content = content.replace(/`DELETE FROM (\w+) WHERE (.+)`/g, (match, table, condition) => 
        `prisma.${table}.delete({ where: { ${condition.replace(/=/g, ':')} } })`
    );

    // Write the updated content back to the file
    fs.writeFileSync(filePath, content);
    console.log(`Converted file: ${filePath}`);
}

function processDirectory(directory) {
    const files = fs.readdirSync(directory);

    files.forEach(file => {
        const filePath = path.join(directory, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            processDirectory(filePath);
        } else if (path.extname(file) === '.ts') {
            convertFile(filePath);
        }
    });
}

processDirectory(modelsDir);
console.log('Conversion complete. Please review the changes manually.');