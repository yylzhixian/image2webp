const { exec } = require('child_process');

function build() {
    return new Promise((resolve, reject) => {
        exec(`npm run build --prefix web`, (error, stdout) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(stdout);
        });
    });
}

async function main() {
    const res = await build();
    console.log(res);
}

main();
