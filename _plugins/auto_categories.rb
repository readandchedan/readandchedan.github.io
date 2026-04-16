Jekyll::Hooks.register :posts, :post_init do |post|
  if post.path.include?('tabletennis')
    post.data['category'] = 'tabletennis'
  elsif post.path.include?('nonfiction')
    post.data['category'] = 'nonfiction'
  elsif post.path.include?('fiction')
    post.data['category'] = 'fiction'
  end
end
