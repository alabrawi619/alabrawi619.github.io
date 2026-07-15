# frozen_string_literal: true

module Jekyll
  class BlogPages < Generator
    safe true
    priority :low

    def generate(site)
      site.pages.each do |page|
        next unless page.path.start_with?("blogs/")
        next if page.path == "blogs/index.md"

        relative_path = page.path.delete_prefix("blogs/").sub(/\.[^.]+\z/, "")
        path_parts = relative_path.split("/")

        page.data["blog_section"] ||= path_parts.first
        page.data["title"] ||= path_parts.last
        page.data["permalink"] ||= "/blogs/#{path_parts.map { |part| Utils.slugify(part) }.join("/")}/"
      end
    end
  end
end
