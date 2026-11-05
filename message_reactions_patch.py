from pathlib import Path


PATCH_MARKER = "# VANTARMOR_MESSAGE_REACTIONS"
HELPERS = r'''# VANTARMOR_MESSAGE_REACTIONS
KISS_GIFS = (
    "https://media.tenor.com/-I2QfQvG8fEAAAAC/anime-kiss.gif",
    "https://media.giphy.com/media/10UVJ0IXjUbPug/giphy.gif",
)
SLAP_GIFS = (
    "https://media.tenor.com/v1a5sM-9VnoAAAAC/anime-slap.gif",
    "https://media.giphy.com/media/3XlEk2RxPS1m8/giphy.gif",
)


class ReactionChoiceView(discord.ui.View):
    def __init__(self, initiator, recipient, action):
        super().__init__(timeout=300)
        self.initiator = initiator
        self.recipient = recipient
        self.action = action
        self.finished = False

    async def interaction_check(self, interaction):
        if interaction.user.id != self.recipient.id:
            await interaction.response.send_message(
                "Este botón es para la persona mencionada en el mensaje.", ephemeral=True
            )
            return False
        if self.finished:
            await interaction.response.send_message("Esta interacción ya terminó.", ephemeral=True)
            return False
        return True

    async def finish(self, interaction, outcome):
        self.finished = True
        for item in self.children:
            item.disabled = True
        if self.action == "kiss" and outcome == "match":
            text = f"💋 {self.recipient.mention} ha devuelto el beso a {self.initiator.mention}."
            image = random.choice(KISS_GIFS)
        elif self.action == "kiss":
            text = f"🤦🏻 {self.recipient.mention} ha rechazado el beso de {self.initiator.mention}."
            image = None
        else:
            text = f"😡 {self.recipient.mention} le ha devuelto la bofetada a {self.initiator.mention}."
            image = random.choice(SLAP_GIFS)
        embed = discord.Embed(color=discord.Color.blurple())
        if image:
            embed.set_image(url=image)
        await interaction.response.edit_message(content=text, embed=embed, view=None)

    @discord.ui.button(label="💋 Coincidir", style=discord.ButtonStyle.success)
    async def match(self, interaction, button):
        if self.action != "kiss":
            await interaction.response.send_message("Esta opción no está disponible.", ephemeral=True)
            return
        await self.finish(interaction, "match")

    @discord.ui.button(label="🤦🏻 Rechazar", style=discord.ButtonStyle.secondary)
    async def reject(self, interaction, button):
        if self.action != "kiss":
            await interaction.response.send_message("Esta opción no está disponible.", ephemeral=True)
            return
        await self.finish(interaction, "reject")

    @discord.ui.button(label="😡 Devolver", style=discord.ButtonStyle.danger)
    async def return_slap(self, interaction, button):
        if self.action != "slap":
            await interaction.response.send_message("Esta opción no está disponible.", ephemeral=True)
            return
        await self.finish(interaction, "return")


async def handle_reaction_command(message, content):
    parts = content.split(maxsplit=1)
    command = parts[0].casefold() if parts else ""
    if command not in ("?kiss", "?slap"):
        return False
    if not message.mentions:
        await message.reply(
            f"Menciona a una persona. Uso: `{command} @usuario`",
            mention_author=False,
        )
        return True
    target = message.mentions[0]
    if target.bot:
        await message.reply("Elige a una persona, no a un bot. 🙈", mention_author=False)
        return True
    if target.id == message.author.id:
        await message.reply("No puedes elegirte a ti mismo para esta interacción. 😅", mention_author=False)
        return True

    if command == "?kiss":
        text = f"💋 {message.author.mention} ha besado a {target.mention}."
        image = random.choice(KISS_GIFS)
        view = ReactionChoiceView(message.author, target, "kiss")
    else:
        text = f"👋 {message.author.mention} ha abofeteado a {target.mention}."
        image = random.choice(SLAP_GIFS)
        view = ReactionChoiceView(message.author, target, "slap")
    embed = discord.Embed(color=discord.Color.blurple())
    embed.set_image(url=image)
    await message.channel.send(
        content=text,
        embed=embed,
        view=view,
        allowed_mentions=discord.AllowedMentions(users=True, roles=False, everyone=False),
    )
    return True
'''


def patch_app(app_file: Path) -> None:
    source = app_file.read_text(encoding="utf-8")
    if PATCH_MARKER in source:
        return

    event_marker = "@client.event\nasync def on_message(message):\n"
    if event_marker not in source:
        raise RuntimeError("No encontré on_message en app.py para añadir ?kiss y ?slap.")

    content_line = '    content = message.content.strip()\n'
    if content_line not in source:
        raise RuntimeError("No encontré la línea de contenido de on_message en app.py.")

    source = source.replace(event_marker, HELPERS + "\n\n" + event_marker, 1)
    source = source.replace(
        content_line,
        content_line + "    if await handle_reaction_command(message, content):\n        return\n",
        1,
    )
    app_file.write_text(source, encoding="utf-8")
