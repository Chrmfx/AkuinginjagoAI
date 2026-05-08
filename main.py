import pygame
import sys

pygame.init()

# =============================
# SETUP
# =============================
WIDTH = 1000
HEIGHT = 500

screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Stickman Platformer")

clock = pygame.time.Clock()

# =============================
# WARNA
# =============================
SKY = (135, 206, 235)
GROUND = (50, 180, 75)
DIRT = (120, 70, 15)
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
RED = (220, 50, 50)

# =============================
# PLAYER
# =============================
player_x = 100
player_y = 300

player_w = 40
player_h = 70

velocity_y = 0
gravity = 0.8
jump_power = -15

speed = 5
on_ground = False

# =============================
# PLATFORM / GROUND
# =============================
ground_y = 400

# Lubang
holes = [
    pygame.Rect(250, ground_y, 120, 100),
    pygame.Rect(500, ground_y, 150, 100),
    pygame.Rect(800, ground_y, 100, 100),
]

# =============================
# FONT
# =============================
font = pygame.font.SysFont("Arial", 32)

# =============================
# SCORE
# =============================
score = 0
game_over = False

# =============================
# DRAW STICKMAN
# =============================
def draw_stickman(x, y):
    # Kepala
    pygame.draw.circle(screen, BLACK, (x + 20, y + 15), 12)

    # Badan
    pygame.draw.line(screen, BLACK, (x + 20, y + 28), (x + 20, y + 50), 4)

    # Tangan
    pygame.draw.line(screen, BLACK, (x + 5, y + 38), (x + 35, y + 38), 4)

    # Kaki
    pygame.draw.line(screen, BLACK, (x + 20, y + 50), (x + 5, y + 70), 4)
    pygame.draw.line(screen, BLACK, (x + 20, y + 50), (x + 35, y + 70), 4)


# =============================
# GAME LOOP
# =============================
while True:

    # =========================
    # EVENT
    # =========================
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            sys.exit()

        if event.type == pygame.KEYDOWN:
            if game_over and event.key == pygame.K_r:
                # Reset game
                player_x = 100
                player_y = 300
                velocity_y = 0
                score = 0
                game_over = False

    keys = pygame.key.get_pressed()

    if not game_over:

        # =====================
        # GERAK PLAYER
        # =====================
        if keys[pygame.K_a] or keys[pygame.K_LEFT]:
            player_x -= speed

        if keys[pygame.K_d] or keys[pygame.K_RIGHT]:
            player_x += speed

        # Lompat
        if (keys[pygame.K_SPACE]) and on_ground:
            velocity_y = jump_power
            on_ground = False

        # Gravity
        velocity_y += gravity
        player_y += velocity_y

        # Batas tanah
        player_rect = pygame.Rect(player_x, player_y, player_w, player_h)

        standing = False

        # Cek apakah di atas lubang
        in_hole = False
        for hole in holes:
            if player_rect.colliderect(hole):
                in_hole = True

        if player_y + player_h >= ground_y and not in_hole:
            player_y = ground_y - player_h
            velocity_y = 0
            standing = True

        on_ground = standing

        # Jatuh ke bawah = kalah
        if player_y > HEIGHT:
            game_over = True

        # Score berdasarkan jarak
        score = max(score, player_x - 100)

    # =========================
    # DRAW
    # =========================
    screen.fill(SKY)

    # Matahari
    pygame.draw.circle(screen, (255, 230, 0), (850, 80), 40)

    # Ground
    pygame.draw.rect(
        screen,
        GROUND,
        (0, ground_y, WIDTH, HEIGHT - ground_y)
    )

    # Dirt layer
    pygame.draw.rect(
        screen,
        DIRT,
        (0, ground_y + 20, WIDTH, HEIGHT - ground_y)
    )

    # Lubang
    for hole in holes:
        pygame.draw.rect(screen, BLACK, hole)

    # Stickman
    draw_stickman(player_x, player_y)

    # Score text
    score_text = font.render(f"Score: {score}", True, WHITE)
    screen.blit(score_text, (20, 20))

    # Finish line
    pygame.draw.rect(screen, RED, (950, 300, 20, 100))

    # Menang
    if player_x > 930:
        win_text = font.render("KAMU MENANG!", True, WHITE)
        screen.blit(win_text, (350, 180))

    # Game over
    if game_over:
        over_text = font.render("GAME OVER", True, RED)
        retry_text = font.render("Tekan R untuk restart", True, WHITE)

        screen.blit(over_text, (380, 180))
        screen.blit(retry_text, (300, 240))

    pygame.display.update()
    clock.tick(60)
