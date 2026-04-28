export type EventMetaData = {
  flyer: string;
};

export type ArtistMetaData = {
  gridOrder: number;
  artistNameLabel: string;
  mixLinks: MixListLink[];
  features?: ArtistFeature[];
  attachment?: string | any;
};

export interface MixListLink {
  label: string;
  link: string;
}

type ArtistFeature = "radioShow";
