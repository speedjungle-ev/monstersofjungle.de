import { getNextRadioShowDate } from "../utils/get-next-radio-show-date.ts";

export default {
  artistNameLabel: "elektrik earliner",
  mixLinks: [
    {
      label: "classic modern analog digital 235711",
      link: "https://www.mixcloud.com/elektrik_earliner/classic-modern-analog-digital-235711/",
    },
    {
      label: "burning beach 2018 part1",
      link: "https://www.mixcloud.com/elektrik_earliner/burning-beach-2018-mixdown-part1/",
    },
    {
      label: "burning beach 2018 part2",
      link: "https://www.mixcloud.com/elektrik_earliner/uploading-burning-beach-2018-mixdown-part2/",
    },
    {
      label: "dachboden session dezember 2017",
      link: "https://www.mixcloud.com/dachboden/dachboden-special-by-elektrik-earliner-december-2017/",
    },
    {
      label: "my fluid hard mix",
      link: "https://www.mixcloud.com/elektrik_earliner/my-fluid-hard-mix/",
    },
    {
      label: "diggin in da crates",
      link: "https://www.mixcloud.com/elektrik_earliner/diggin-in-da-crates/",
    },
    {
      label: "all sounds elektrik earliner mix",
      link: "https://www.mixcloud.com/elektrik_earliner/all-sounds-elektrik-earliner-mix/",
    },
  ],
  nextRadioEvent: getNextRadioShowDate(Date.now()),
};
