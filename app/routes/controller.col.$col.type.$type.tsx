import { json, LoaderFunction } from "@remix-run/node";
import { ObjectId } from "mongodb";
import { connectToMongoDB, getMongoDB } from "~/models/mongodb";

export const action: LoaderFunction = async ({ params, request }) => {
    const {col, type} = params;
    const res = await request.json() as any;
    connectToMongoDB();
    const db = getMongoDB();
    const collection = db.collection(col as string);
    if(res['_id']) res['_id'] = new ObjectId(res['_id']);
    switch(type){
        case 'get':{
            const user = await collection.findOne(res);
            return json(user || {});
        }
        case 'getAll':{
            const users = await collection.find({}).toArray();
            return json(users);
        }
        case 'create':{
            const user = await collection.findOne({username:{$regex:new RegExp(`^${res.username}$`, 'i')}});
            if(user) return json({error:'Username already exists'});
            const ins = await collection.insertOne(res);
            return json({success:ins.insertedId});
        }
        case 'update':{
            if(res.filter['_id']) res.filter['_id'] = new ObjectId(res.filter['_id']);
            const upd = await collection.updateOne(res.filter, {$set:res.update});
            return json({success:upd.modifiedCount});
        }
        case 'updateAll':{
            const upd = await collection.updateMany({}, {$set:res});
            return json({success:upd.modifiedCount});
        }
        case 'delete':{
            const del = await collection.deleteOne(res);
            return json({success:del.deletedCount});
        }
        case 'deleteAll':{
            const del = await collection.deleteMany({});
            return json({success:del.deletedCount});
        }
        case 'deleteKeys':{
            const obj:{[key:string]:''} = {}
            for(let key of res) obj[key] = '';
            const del = await collection.updateMany({}, {$unset:obj});
            return json({success:del.modifiedCount});
        }
        default:{
            return json({error:'Invalid type'});
        }
    }
}