export default function (eleventyConfig) {
  // Static files copied as-is to the output.
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/files");
  eleventyConfig.addPassthroughCopy("src/images");

  // Collections: one folder per section. Items with an `order` field are sorted
  // by it (ascending); everything else is sorted newest first by `date`.
  const sortItems = (a, b) =>
    (a.data.order ?? Infinity) - (b.data.order ?? Infinity) || b.date - a.date;
  for (const name of ["projects", "publications", "teaching", "talks", "internships", "posts"]) {
    eleventyConfig.addCollection(name, (api) =>
      api.getFilteredByGlob(`src/${name}/*.md`).sort(sortItems)
    );
  }

  const toDate = (d) => (d === "now" ? new Date() : new Date(d));
  eleventyConfig.addFilter("year", (date) => toDate(date).getUTCFullYear());
  eleventyConfig.addFilter("readableDate", (date) =>
    new Date(date).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })
  );

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
