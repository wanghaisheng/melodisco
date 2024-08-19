import { FavoriteSong, Song } from "@/types/song";
import { getDb } from "./db";
import { getSongsFromPrismaResult } from "./song";
import { Prisma } from "@prisma/client";

export async function insertFavoriteSong(song: FavoriteSong) {
  const prisma = getDb();
  const res = await prisma.favorite_songs.create({
    data: {
      song_uuid: song.song_uuid,
      user_uuid: song.user_uuid,
      created_at: song.created_at,
      updated_at: song.updated_at,
      status: song.status,
    }
  });

  return res;
}

export async function updateFavoriteSong(song: FavoriteSong) {
  const prisma = getDb();
  const res = await prisma.favorite_songs.update({
    where: {
      unique_favorite_song: {
        song_uuid: song.song_uuid,
        user_uuid: song.user_uuid
      }
    },
    data: {
      status: song.status,
      updated_at: song.updated_at
    }
  });

  return res;
}

export async function findFavoriteSong(
  song_uuid: string,
  user_uuid: string
): Promise<FavoriteSong | undefined> {
  const prisma = getDb();
  const res = await prisma.favorite_songs.findUnique({
    where: {
      unique_favorite_song: {
        song_uuid: song_uuid,
        user_uuid: user_uuid
      }
    }
  });

  return res ? formatFavoriteSong(res) : undefined;
}

export async function getUserFavoriteSongs(
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

  const prisma = getDb();
  const favoriteSongs = await prisma.favorite_songs.findMany({
    where: {
      user_uuid: user_uuid,
      status: 'on'
    },
    orderBy: {
      created_at: 'desc'
    },
    take: limit,
    skip: offset
  });

  if (favoriteSongs.length === 0) {
    return undefined;
  }

  const songUuids = favoriteSongs.map(fs => fs.song_uuid);
  const songs = await prisma.songs.findMany({
    where: {
      uuid: {
        in: songUuids
      }
    }
  });

  const formattedSongs = getSongsFromPrismaResult( songs);

  return formattedSongs
}
// ... existing code ...

export function formatFavoriteSong(row: Prisma.favorite_songsGetPayload<{}>): FavoriteSong {
  const favoriteSong: FavoriteSong = {
    song_uuid: row.song_uuid,
    user_uuid: row.user_uuid,
    created_at: row.created_at.toISOString() ?? '',
    updated_at: row.updated_at.toISOString() ?? '',
    status: row.status ?? '',
  };

  return favoriteSong;
}