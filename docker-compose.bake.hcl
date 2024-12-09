group "default" {
  targets = ["app-php", "vite"]
}

target "app-php" {
  context = "."
  dockerfile = "Dockerfile"
  target = "frankenphp_dev"
  tags = ["app-php:latest"]
}

target "vite" {
  context = "."
  dockerfile = "Dockerfile.node"
  tags = ["vite:latest"]
}
