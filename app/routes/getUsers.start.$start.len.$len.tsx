import { json, LoaderFunction } from "@remix-run/node";
import { connectToMongoDB, getMongoDB } from "~/models/mongodb";

export const loader: LoaderFunction = async ({ params }) => {
    const {start, len} = params;
    connectToMongoDB();
    const db = getMongoDB();
    const collection = db.collection("users");
    const users = await collection.find({}).sort({rating:-1}).skip(+(start as string)).limit(+(len as string)).toArray();
    return json(users);
}