group "default" {
  targets = ["app-php"]
}

target "app-php" {
  context = "."
  dockerfile = "Dockerfile"
  target = "frankenphp_dev"
  tags = ["app-php:latest"]
}
