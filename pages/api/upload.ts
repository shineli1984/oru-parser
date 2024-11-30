import multer from "multer";
import fs from "fs";
import type { NextApiRequest, NextApiResponse } from "next";
import { parseORUFile, getAbnormalResults } from "../../utils/analysis";
import { connectToDatabase } from "../../utils/db";

// Configure multer to handle file uploads
const upload = multer({ dest: "/tmp/" });

export const config = {
  api: {
    bodyParser: false, // Disable body parsing to handle file uploads
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const db = await connectToDatabase();

    // Wrap multer in a promise to handle async file uploads
    const multerPromise = new Promise<void>((resolve, reject) => {
      upload.single("file")(req as any, {} as any, (err: any) => {
        if (err) return reject(err);
        resolve();
      });
    });

    try {
      await multerPromise; // Wait for multer to complete
      const filePath = (req as any).file?.path;

      if (!filePath) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const oruData = fs.readFileSync(filePath, "utf-8");
      const parsedData = parseORUFile(oruData);
      const abnormalResults = await getAbnormalResults(db, parsedData);

      fs.unlinkSync(filePath); // Clean up temporary file
      return res.status(200).json(abnormalResults);
    } catch (error) {
      console.error("Error processing upload:", error);
      return res.status(500).json({ error: "Failed to process file upload" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
};

export default handler;
