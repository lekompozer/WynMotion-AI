# Production Server & Docker Maintenance Rules (104.248.147.155)

> 🔴 **CRITICAL PROHIBITION: NEVER RUN `docker system prune -a` OR `docker image prune -a` ON PRODUCTION**

### Why this rule exists:
- Running `docker system prune -a` or `docker image prune -a` deletes **ALL unreferenced images**, including core infrastructure base images like `mongo:7.0`, `redis:7-alpine`, `nginx:1.26-alpine`, etc.
- When container recreation or restarts occur, services like MongoDB, Redis, or Nginx will fail to start because their images were erased, leading to database connection failures (`[Errno -3] Temporary failure in name resolution` for `mongodb:27017`) and breaking production health checks.

---

### ✅ SAFE COMMANDS TO FREE DISK SPACE ON PRODUCTION:

1. **Clean BuildKit Cache (Safe & frees 90%+ wasted space):**
   ```bash
   ssh root@104.248.147.155 "docker builder prune -a -f"
   ```

2. **Clean Dangling Images Only (Safe - does NOT delete named images like mongo/redis):**
   ```bash
   ssh root@104.248.147.155 "docker image prune -f"
   ```

3. **Clean Stopped Containers & Anonymous Volumes (Safe):**
   ```bash
   ssh root@104.248.147.155 "docker container prune -f && docker volume prune -f"
   ```

4. **Recommended One-Liner for Disk Cleanup:**
   ```bash
   ssh root@104.248.147.155 "docker builder prune -a -f && docker image prune -f"
   ```

---

### 🚨 Recovery Checklist if MongoDB / Services ever go down:
If MongoDB image is accidentally pruned or container stops:
```bash
ssh root@104.248.147.155 "cd /home/hoile/wordai && docker compose up -d mongodb redis-server nginx"
ssh root@104.248.147.155 "cd /home/hoile/wordai && docker compose restart ai-chatbot-rag"
```
