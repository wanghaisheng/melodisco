import { PlaySong, Song } from "@/types/song";
import { getDb } from "./db";
import { Prisma } from "@prisma/client";
import { getSongsFromPrismaResult } from "./song";

export async function insertPlaySong(song: PlaySong) {
  const prisma = getDb();

  return prisma.play_songs.create({
    data: {
      song_uuid: song.song_uuid,
      user_uuid: song.user_uuid,
      created_at: song.created_at,
    },
  });
}

function formatPlaySong(row: Prisma.play_songsGetPayload<{}>): PlaySong {
  return {
    song_uuid: row.song_uuid,
    user_uuid: row.user_uuid,
    created_at: row.created_at.toISOString(),
  };
}


// ... other functions ...

export async function getUserPlaySongs(
  user_uuid: string,
  page: number,
  limit: number
): Promise<Song[] | undefined> {
  if (page < 1) {
    page = 1;
  }
  if (limit <= 0) {
    limit = 50;
  }
  const offset = (page - 1) * limit;

  const db = getDb();
  const res = await db.$queryRaw<(Prisma.songsGetPayload<{}> & { created_at: Date })[]>`
  SELECT s.*, p.song_uuid, p.created_at
    FROM (
      SELECT song_uuid, MAX(created_at) as MaxCreatedAt
      FROM play_songs WHERE user_uuid = ${user_uuid}
      GROUP BY song_uuid
    ) AS latest
    JOIN play_songs p ON latest.song_uuid = p.song_uuid AND latest.MaxCreatedAt = p.created_at
    JOIN songs s ON p.song_uuid = s.uuid
    ORDER BY p.created_at DESC LIMIT ${limit} OFFSET ${offset};`

    if (res.length === 0) {
      return undefined;
  }

  return getSongsFromPrismaResult(res);
}