import { drizzle } from 'drizzle-orm/postgres-js';
import {migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres';
import "dotenv/config";



const queryClient =  postgres(process.env.DATABASE_URL as string,{max:1});


async function main () {
    await migrate(drizzle(queryClient),{
        migrationsFolder:"../migration/meta"
    
    })
    await queryClient.end()
}

main()
