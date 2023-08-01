import mongoose from "mongoose";
import { createSpinner } from 'nanospinner';
import "colors"

export async function initDatabaseConnection(mongooseURI: string) {
    return new Promise<void>((resolve, reject) => {
        const dbSpinner = createSpinner(`Connecting to database...`).start({ color: 'green' });

        mongoose.connect(mongooseURI).then(() => {
            dbSpinner.success({ text: `Connection to the database has been successfully initialized!\n` })
            resolve()
        }).catch((e) => {
            reject(e)
            dbSpinner.error({ text: 'Something went wrong while connecting to the database:\n    ' + e.message })
        });

        mongoose.Promise = global.Promise;


        mongoose.connection.on("error", (err) => {
            console.log(`[Database] Mongoose connection error: ${err.stack}`);
        });
        mongoose.connection.on("disconnected", () => {
            console.log(`[Database] Mongoose connection lost`);
        });
    })
}

