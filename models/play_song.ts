import { PlaySong, Song } from "@/types/song";
import { getDb } from "./db";
import { Prisma } from "@prisma/client";

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

export async function getUserPlaySongs(
  user_uuid: string,
  page: number,
  limit: number
): Promise<{ songs: Song[]; totalCount: number } | undefined> {
  const prisma = getDb();
  if (page < 1) page = 1;
  if (limit <= 0) limit = 50;
  const offset = (page - 1) * limit;

  const [rows, totalCount] = await prisma.$transaction([
    prisma.play_songs.findMany({
      where: { user_uuid: user_uuid },
      orderBy: { created_at: 'desc' },
      distinct: ['song_uuid'],
      take: limit,
      skip: offset,
      include: {
        song: {
          include: {
            artist: true,
            album: true,
          },
        },
      },
    }),
    prisma.play_songs.count({
      where: { user_uuid: user_uuid },
      distinct: ['song_uuid'],
    }),
  ]);

  if (rows.length === 0) return undefined;

  const songs = rows.map(row => ({
    ...row.song,
    last_played: row.created_at.toISOString(),
  }));

  return { songs, totalCount };
}