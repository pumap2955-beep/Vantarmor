from pathlib import Path
import re


REACTION_MARKER = "# VANTARMOR_MESSAGE_REACTIONS_V2"
REACTION_HELPERS = r'''# VANTARMOR_MESSAGE_REACTIONS_V2
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

AFK_COOKIE_MARKER = "# VANTARMOR_AFK_COOKIE_FIX"
AFK_COOKIE_HELPERS = r'''# VANTARMOR_AFK_COOKIE_FIX

def elapsed_label(seconds):
    seconds = max(0, int(seconds))
    if seconds >= 365 * 86400:
        return f"{seconds // (365 * 86400)} año(s)"
    if seconds >= 30 * 86400:
        return f"{seconds // (30 * 86400)} mes(es)"
    if seconds >= 86400:
        return f"{seconds // 86400} día(s)"
    if seconds >= 3600:
        return f"{seconds // 3600}h"
    if seconds >= 60:
        return f"{seconds // 60}m"
    return f"{seconds}s"


def afk_departure_text(user, state):
    duration = elapsed_label(time.time() - state.get("started", time.time()))
    reason = state.get("reason") or "Sin motivo"
    return f"👋 {user.mention} ha salido de su estado AFK.\n⏱️ Llevaba **{duration}** AFK.\n📝 Motivo: {reason}"


class CookieGameView(discord.ui.View):
    def __init__(self):
        # The winner button is available briefly; no periodic message edits occur.
        super().__init__(timeout=60)
        self.message = None
        self.winner_id = None
        self.winner_lock = asyncio.Lock()

    @discord.ui.button(label="🍪", style=discord.ButtonStyle.success)
    async def grab_cookie(self, interaction, button):
        async with self.winner_lock:
            if self.winner_id is not None:
                await interaction.response.send_message("La galleta ya tiene dueño. 🍪", ephemeral=True)
                return
            self.winner_id = interaction.user.id
            for child in self.children:
                child.disabled = True
            await interaction.response.edit_message(
                content=f"🍪 {interaction.user.mention} fue la primera persona en ganar la galleta. ¡Felicidades!",
                view=self,
                allowed_mentions=discord.AllowedMentions(users=True, roles=False, everyone=False),
            )
            self.stop()

    async def on_timeout(self):
        if self.winner_id is not None:
            return
        for child in self.children:
            child.disabled = True
        if self.message is not None:
            try:
                await self.message.edit(
                    content="🍪 Nadie alcanzó la galleta esta vez. ¡Inténtalo en la próxima partida!",
                    view=self,
                )
            except discord.HTTPException:
                pass
'''


def _remove_generated_block(source: str, marker: str, next_marker: str) -> str:
    if marker not in source:
        return source
    start = source.index(marker)
    end = source.index(next_marker, start)
    return source[:start] + source[end:]


def patch_app(app_file: Path) -> None:
    source = app_file.read_text(encoding="utf-8")
    event_marker = "@client.event\nasync def on_message(message):\n"
    if event_marker not in source:
        raise RuntimeError("No encontré on_message en app.py para aplicar las correcciones.")

    source = _remove_generated_block(source, REACTION_MARKER, event_marker)
    source = _remove_generated_block(source, "# VANTARMOR_MESSAGE_REACTIONS\n", event_marker)
    source = _remove_generated_block(source, AFK_COOKIE_MARKER, '@tree.command(name="cookie"')

    content_line = '    content = message.content.strip()\n'
    command_line = '    command = parts[0].lower() if parts else ""\n'
    if content_line not in source or command_line not in source:
        raise RuntimeError("No encontré el contenido o el parser de comandos de on_message.")

    source = source.replace(event_marker, REACTION_HELPERS + "\n\n" + event_marker, 1)
    reaction_dispatch = "    if await handle_reaction_command(message, content):\n        return\n"
    if reaction_dispatch not in source:
        source = source.replace(content_line, content_line + reaction_dispatch, 1)

    cookie_decorator = '@tree.command(name="cookie", description="Juego de tocar la galleta", guild=GUILD)'
    if cookie_decorator not in source:
        raise RuntimeError("No encontré el comando /cookie en app.py.")
    source = source.replace(cookie_decorator, AFK_COOKIE_HELPERS + "\n\n" + cookie_decorator, 1)

    cookie_block = re.compile(
        r'@tree\.command\(name="cookie", description="Juego de tocar la galleta", guild=GUILD\)\n'
        r'async def cookie\(interaction\):\n'
        r'    await interaction\.response\.send_message\([^\n]*\)'
    )
    cookie_replacement = '''@tree.command(name="cookie", description="Juego de tocar la galleta", guild=GUILD)
async def cookie(interaction):
    await interaction.response.send_message("🍪 La galleta aparece en **5 segundos**…")
    await asyncio.sleep(5)
    view = CookieGameView()
    await interaction.edit_original_response(
        content="🍪 ¡Ya apareció! Sé la primera persona en tocar el botón verde.",
        view=view,
    )
    view.message = await interaction.original_response()'''
    source, cookie_count = cookie_block.subn(cookie_replacement, source, count=1)
    if cookie_count != 1:
        raise RuntimeError("No pude actualizar el comando /cookie con la cuenta regresiva y el botón.")

    old_afk = (
        '    state = afk_users.pop((message.guild.id, message.author.id), None)\n'
        '    if state:\n'
        '        await message.channel.send(f"{message.author.mention} salió de AFK tras {elapsed_label(time.time() - state[\'started\'])}.", allowed_mentions=discord.AllowedMentions.none())\n'
    )
    afk_dispatch = '''    state = afk_users.pop((message.guild.id, message.author.id), None)
    if state:
        await message.channel.send(
            afk_departure_text(message.author, state),
            allowed_mentions=discord.AllowedMentions(users=True, roles=False, everyone=False),
        )
'''
    if old_afk in source:
        source = source.replace(old_afk, "", 1)
    if afk_dispatch not in source:
        source = source.replace(command_line, command_line + afk_dispatch, 1)

    interaction_marker = "        data = interaction.data or {}\n"
    slash_afk = '''        afk_state = afk_users.pop((interaction.guild.id, interaction.user.id), None)
        if afk_state and interaction.channel is not None:
            await interaction.channel.send(
                afk_departure_text(interaction.user, afk_state),
                allowed_mentions=discord.AllowedMentions(users=True, roles=False, everyone=False),
            )
'''
    if interaction_marker not in source:
        raise RuntimeError("No encontré el manejador de interacciones para corregir /afk.")
    if slash_afk not in source:
        source = source.replace(interaction_marker, interaction_marker + slash_afk, 1)

    app_file.write_text(source, encoding="utf-8")
