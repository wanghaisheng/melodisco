import { PlaySong, Song } from "@/types/song";
import { getDb } from "./db";
import { Prisma } from "@prisma/client";

export async function insertPlaySong(song: PlaySong) {
  const prisma = getDb();

  return prisma.playSongs.create({
    data: {
      songUuid: song.song_uuid,
      userUuid: song.user_uuid,
      createdAt: song.created_at,
    },
  });
}

function formatPlaySong(row: Prisma.playSongsCreateInput): PlaySong {
  return {
    song_uuid: row.songUuid,
    user_uuid: row.userUuid,
    created_at: row.createdAt,
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
    prisma.playSongs.findMany({
      where: { userUuid: user_uuid },
      orderBy: { createdAt: 'desc' },
      distinct: ['songUuid'],
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
    prisma.playSongs.count({
      where: { userUuid: user_uuid },
      distinct: ['songUuid'],
    }),
  ]);

  if (rows.length === 0) return undefined;

  const songs = rows.map(row => ({
    ...row.song,
    last_played: row.createdAt,
  }));

  return { songs, totalCount };
}