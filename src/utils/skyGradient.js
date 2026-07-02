export function getSkyGradient(type, progress) {
  if (type === "moon") {
    return {
      background:
        "radial-gradient(circle at 50% 18%, rgba(207, 226, 255, 0.12), transparent 16%), radial-gradient(circle at 50% 100%, rgba(69, 110, 173, 0.42), transparent 46%), linear-gradient(180deg, #020617 0%, #071525 24%, #102442 58%, #28466d 100%)",
    };
  }

  if (progress < 0.18) {
    return {
      background:
        "radial-gradient(circle at 50% 100%, rgba(255, 210, 150, 0.42), transparent 42%), radial-gradient(circle at 50% 28%, rgba(255, 205, 168, 0.18), transparent 24%), linear-gradient(180deg, #173355 0%, #42628e 26%, #b66d8a 60%, #ffd4a4 100%)",
    };
  }

  if (progress < 0.68) {
    return {
      background:
        "radial-gradient(circle at 50% 108%, rgba(255, 244, 212, 0.32), transparent 44%), radial-gradient(circle at 50% 18%, rgba(255, 255, 255, 0.1), transparent 18%), linear-gradient(180deg, #1f69c8 0%, #4ea2f0 30%, #8ed1ff 66%, #eefbff 100%)",
    };
  }

  if (progress < 0.9) {
    return {
      background:
        "radial-gradient(circle at 50% 102%, rgba(255, 187, 132, 0.44), transparent 38%), radial-gradient(circle at 50% 22%, rgba(255, 205, 196, 0.14), transparent 20%), linear-gradient(180deg, #102b4a 0%, #403f8f 28%, #b96078 64%, #ffc78d 100%)",
    };
  }

  return {
    background:
      "radial-gradient(circle at 50% 102%, rgba(255, 179, 113, 0.34), transparent 32%), linear-gradient(180deg, #06162f 0%, #15325b 38%, #37506d 72%, #eeb07a 100%)",
  };
}
