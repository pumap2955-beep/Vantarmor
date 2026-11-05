from pathlib import Path


PATCH_MARKER = "# VANTARMOR_MESSAGE_REACTIONS_V2"
HELPERS = r'''# VANTARMOR_MESSAGE_REACTIONS_V2
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
        if action == "kiss":
            match = discord.ui.Button(label="💋 Coincidir", style=discord.ButtonStyle.success)
            reject = discord.ui.Button(label="🤦🏻 Rechazar", style=discord.ButtonStyle.secondary)
            match.callback = self.match
            reject.callback = self.reject
            self.add_item(match)
            self.add_item(reject)
        else:
            slap_back = discord.ui.Button(label="😡 Devolver", style=discord.ButtonStyle.danger)
            slap_back.callback = self.return_slap
            self.add_item(slap_back)

    async def interaction_check(self, interaction):
        if interaction.user.id != self.recipient.id:
            await interaction.response.send_message(
                "Este botón es para la persona del mensaje al que se respondió.", ephemeral=True
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
            text = f"😡 {self.recipient.mention} ha devuelto la bofetada a {self.initiator.mention}."
            image = random.choice(SLAP_GIFS)
        embed = discord.Embed(color=discord.Color.blurple())
        if image:
            embed.set_image(url=image)
        await interaction.response.edit_message(
            content=text,
            embed=embed,
            view=self,
            allowed_mentions=discord.AllowedMentions(users=True, roles=False, everyone=False),
        )

    async def match(self, interaction):
        await self.finish(interaction, "match")

    async def reject(self, interaction):
        await self.finish(interaction, "reject")

    async def return_slap(self, interaction):
        await self.finish(interaction, "return")


async def handle_reaction_command(message, content):
    command = content.split(maxsplit=1)[0].casefold() if content else ""
    if command not in ("?kiss", "?slap"):
        return False

    reference = message.reference
    if reference is None or reference.message_id is None:
        await message.reply(
            f"Responde al mensaje de una persona con `{command}` para usar este comando.",
            mention_author=False,
        )
        return True

    referenced = reference.resolved
    if referenced is None or not hasattr(referenced, "author"):
        try:
            channel = message.guild.get_channel(reference.channel_id)
            if channel is None:
                channel = await client.fetch_channel(reference.channel_id)
            referenced = await channel.fetch_message(reference.message_id)
        except (discord.NotFound, discord.Forbidden, discord.HTTPException):
            await message.reply("No pude encontrar el mensaje al que respondiste.", mention_author=False)
            return True

    target = referenced.author
    if target.bot:
        await message.reply("Elige el mensaje de una persona, no de un bot. 🙈", mention_author=False)
        return True
    if target.id == message.author.id:
        await message.reply("No puedes elegir tu propio mensaje para esta interacción. 😅", mention_author=False)
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
    await message.reply(
        content=text,
        embed=embed,
        view=view,
        mention_author=False,
        allowed_mentions=discord.AllowedMentions(users=True, roles=False, everyone=False),
    )
    return True
'''


def patch_app(app_file: Path) -> None:
    source = app_file.read_text(encoding="utf-8")
    event_marker = "@client.event\nasync def on_message(message):\n"
    if event_marker not in source:
        raise RuntimeError("No encontré on_message en app.py para añadir ?kiss y ?slap.")

    # Replace the earlier runtime-injected implementation if this container has
    # already been patched by an older release.
    old_marker = "# VANTARMOR_MESSAGE_REACTIONS\n"
    if old_marker in source:
        start = source.index(old_marker)
        end = source.index(event_marker, start)
        source = source[:start] + source[end:]

    # The current patch is idempotent and always replaces the generated block
    # up to on_message so a service restart picks up updates cleanly.
    if PATCH_MARKER in source:
        start = source.index(PATCH_MARKER)
        end = source.index(event_marker, start)
        source = source[:start] + source[end:]

    content_line = '    content = message.content.strip()\n'
    if content_line not in source:
        raise RuntimeError("No encontré la línea de contenido de on_message en app.py.")

    source = source.replace(event_marker, HELPERS + "\n\n" + event_marker, 1)
    injection = "    if await handle_reaction_command(message, content):\n        return\n"
    if injection not in source:
        source = source.replace(content_line, content_line + injection, 1)
    app_file.write_text(source, encoding="utf-8")
