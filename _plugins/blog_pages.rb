# frozen_string_literal: true

module Jekyll
  class BlogSectionPage < PageWithoutAFile
    def initialize(site, section)
      slug_parts = section["path"].split("/").map { |part| Utils.slugify(part) }
      super(site, site.source, File.join("blogs", *slug_parts), "index.html")

      data["layout"] = "blog-section"
      data["title"] = section["name"]
      data["description"] = "#{section["total_count"]} #{section["total_count"] == 1 ? "blog" : "blogs"} across this section and its subsections."
      data["blog_section_path"] = section["path"]
      data["blog_pages"] = section["all_pages"].sort_by { |page| page.data["title"].to_s.downcase }
      data["permalink"] = section["url"]
    end
  end

  class BlogPages < Generator
    safe true
    priority :low

    def generate(site)
      sections = {}

      site.pages.each do |page|
        next unless page.path.start_with?("blogs/")
        next if page.path == "blogs/index.md"

        relative_path = page.path.delete_prefix("blogs/").sub(/\.[^.]+\z/, "")
        path_parts = relative_path.split("/")
        directory_parts = path_parts[0...-1]
        directory_path = directory_parts.join("/")

        page.data["blog_section"] ||= directory_parts.first
        page.data["blog_directory"] ||= directory_path
        page.data["title"] ||= path_parts.last
        page.data["permalink"] ||= "/blogs/#{path_parts.map { |part| Utils.slugify(part) }.join("/")}/"

        directory_parts.each_index do |index|
          parts = directory_parts[0..index]
          path = parts.join("/")
          sections[path] ||= {
            "name" => parts.last,
            "path" => path,
            "depth" => index,
            "parent" => index.zero? ? nil : parts[0...-1].join("/"),
            "total_count" => 0,
            "pages" => [],
            "all_pages" => [],
            "url" => "/blogs/#{parts.map { |part| Utils.slugify(part) }.join("/")}/"
          }
          sections[path]["total_count"] += 1
          sections[path]["all_pages"] << page
        end

        sections[directory_path]["pages"] << page unless directory_parts.empty?
      end

      site.data["blog_sections"] = sections.values.sort_by { |section| section["path"].downcase }
      site.data["blog_sections"].each do |section|
        prefix = "#{section["path"]}/"
        section["descendants"] = site.data["blog_sections"].select { |candidate| candidate["path"].start_with?(prefix) }
      end
      site.data["blog_sections"].each { |section| site.pages << BlogSectionPage.new(site, section) }
    end
  end
end
