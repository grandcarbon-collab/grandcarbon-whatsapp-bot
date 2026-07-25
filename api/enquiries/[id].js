// Vercel Serverless Function: /api/enquiries/[id].js
export default function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    return res.status(200).json({ success: true, id, updated: body });
  }

  if (req.method === 'DELETE') {
    return res.status(200).json({ success: true, id });
  }

  return res.status(405).send('Method Not Allowed');
}
