function checkColision(pos1, pos2) {
	return (pos1.x >= pos2.x && pos1.x <= pos2.x + pos2.width) &&
		(pos1.y >= pos2.y && pos1.y <= pos2.y + pos2.height);
}