import { json, LoaderFunction } from "@remix-run/node";
import { connectToMongoDB, getMongoDB } from "~/models/mongodb";

export const action: LoaderFunction = async ({ params, request }) => {
    const {col, type} = params;
    const res = await request.json() as any;
    connectToMongoDB();
    const db = getMongoDB();
    const collection = db.collection(col as string);
    switch(type){
        case 'get':{
            const user = await collection.findOne(res);
            return json(user || {});
        }
        case 'create':{
            const user = await collection.findOne({username:{$regex:new RegExp(`^${res.username}$`, 'i')}});
            if(user) return json({error:'Username already exists'});
            const ins = await collection.insertOne(res);
            return json({success:ins.insertedId});
        }
        case 'update':{
            const upd = await collection.updateOne(res.filter, {$set:res.update});
            return json({success:upd.modifiedCount});
        }
        case 'delete':{
            const del = await collection.deleteOne(res);
            return json({success:del.deletedCount});
        }
        default:{
            return json({error:'Invalid type'});
        }
    }
}