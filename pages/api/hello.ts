// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  name: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log('@@@@@@@@@first' )
  res.setHeader('Content-Type', 'text/html');
  res.status(200).end( 'https://ipfs.livepeer.studio/ipfs/QmURv3J5BGsz23GaCUm7oXncm2M9SCj8RQDuFPGzAFSJw8'   )
}
