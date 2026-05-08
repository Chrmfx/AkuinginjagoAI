# Stickman Voice Jump - Python Version
# Run with: python main.py
#
# Install:
# pip install pygame sounddevice numpy

import pygame
import random
import numpy as np
import sounddevice as sd

# =========================
# GAME SETUP
# =========================
pygame.init()

WIDTH = 800
HEIGHT = 300

screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Stickman Voice Jump")

clock = pygame.time.Clock()

# =========================
# PLAYER
# =========================
player = {
    "x": 100,
    "y": 200,
    "vy": 0,
    "gravity": 0.6,
    "jumpPower": -12,
    "grounded": True
}

# =========================
# GAPS
# =========================
gaps = [
    {"x": 400, "width": 80},
    {"x": 700, "width": 100}
]

speed = 3
score = 0
game_over = False

# =========================
# MICROPHONE
# =========================
volume_level = 0

def audio_callback(indata, frames, time, status):
    global volume_level

    volume_norm = np.linalg.norm(indata) * 10
    volume_level = volume_norm

stream = sd.InputStream(callback=audio_callback)
stream.start()

# =========================
# DRAW PLAYER
# =========================
def draw_player():
    x = int(player["x"])
    y = int(player["y"])

    # head
    pygame.draw.circle(screen, (0, 0, 0), (x, y - 15), 5, 1)

    # body
    pygame.draw.line(screen, (0, 0, 0), (x, y - 10), (x, y + 10), 2)

    # legs
    pygame.draw.line(screen, (0, 0, 0), (x, y), (x - 5, y + 10), 2)
    pygame.draw.line(screen, (0, 0, 0), (x, y), (x + 5, y + 10), 2)

# =========================
# DRAW GROUND
# =========================
def draw_ground():
    prev_x = 0

    for gap in gaps:
        pygame.draw.rect(
            screen,
            (0, 0, 0),
            (prev_x, 220, gap["x"] - prev_x, 80)
        )

        prev_x = gap["x"] + gap["width"]

    pygame.draw.rect(
        screen,
        (0, 0, 0),
        (prev_x, 220, WIDTH - prev_x, 80)
    )

# =========================
# DRAW SCORE
# =========================
font = pygame.font.SysFont("Arial", 20)
big_font = pygame.font.SysFont("Arial", 50)

def draw_score():
    text = font.render(f"Score: {score}", True, (0, 0, 0))
    screen.blit(text, (10, 10))

# =========================
# GAME OVER
# =========================
def draw_game_over():
    overlay = pygame.Surface((WIDTH, HEIGHT))
    overlay.set_alpha(120)
    overlay.fill((200, 0, 0))
    screen.blit(overlay, (0, 0))

    text = big_font.render("YOU ARE DEAD", True, (255, 0, 0))
    screen.blit(text, (180, 130))

# =========================
# RESET GAME
# =========================
def reset_game():
    global player, gaps, score, game_over

    player = {
        "x": 100,
        "y": 200,
        "vy": 0,
        "gravity": 0.6,
        "jumpPower": -12,
        "grounded": True
    }

    gaps = [
        {"x": 400, "width": 80},
        {"x": 700, "width": 100}
    ]

    score = 0
    game_over = False

# =========================
# GAME LOOP
# =========================
running = True

while running:

    clock.tick(60)

    # EVENTS
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

        # restart
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_r and game_over:
                reset_game()

    # BACKGROUND
    screen.fill((255, 255, 255))

    if not game_over:

        score += 1

        # move gaps
        for gap in gaps:
            gap["x"] -= speed

        # recycle gaps
        if gaps[0]["x"] + gaps[0]["width"] < 0:
            gaps.pop(0)

            gaps.append({
                "x": WIDTH + random.randint(0, 200),
                "width": random.randint(60, 120)
            })

        # gravity
        player["vy"] += player["gravity"]
        player["y"] += player["vy"]

        # detect gap
        over_gap = False

        for gap in gaps:
            if player["x"] > gap["x"] and player["x"] < gap["x"] + gap["width"]:
                over_gap = True

        # ground collision
        if not over_gap and player["y"] >= 200:
            player["y"] = 200
            player["vy"] = 0
            player["grounded"] = True
        else:
            player["grounded"] = False

        # fall = dead
        if over_gap and player["y"] > 220:
            game_over = True

        # =========================
        # VOICE JUMP
        # =========================
        # lower sensitivity
        if volume_level > 5 and player["grounded"]:
            player["vy"] = player["jumpPower"]
            player["grounded"] = False

    # DRAW
    draw_ground()
    draw_player()
    draw_score()

    # mic volume debug
    mic_text = font.render(f"Mic: {volume_level:.1f}", True, (0, 0, 255))
    screen.blit(mic_text, (10, 40))

    if game_over:
        draw_game_over()

        restart_text = font.render(
            "Press R to Restart",
            True,
            (255, 255, 255)
        )

        screen.blit(restart_text, (300, 200))

    pygame.display.update()

pygame.quit()
