import { json, LoaderFunction } from "@remix-run/node";
import { connectToMongoDB, getMongoDB } from "~/models/mongodb";


export const action: LoaderFunction = async ({ request }) => {
    const collections:string[] = await request.json();
    connectToMongoDB();
    const db = getMongoDB();
    let res:{[key:string]:any} = {}
    await Promise.all(collections.map(async (col) => {
        res[col] = await db.collection(col).find({}).toArray()
    }))
    return json(res);
}