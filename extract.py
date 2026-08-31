import re
import base64
with open("csharp_wpf/IconData.cs", "r") as f:
    content = f.read()
    match = re.search(r'public static readonly string SkullIconBase64 = @"(.*?)";', content, re.DOTALL)
    if not match:
        match = re.search(r'public static readonly string SkullIconBase64 = "(.*?)";', content, re.DOTALL)
    if match:
        b64 = match.group(1).replace('\n', '').replace('\r', '').replace(' ', '')
        with open("public/app_icon.png", "wb") as out:
            out.write(base64.b64decode(b64))
        print("Success")
    else:
        print("Not found")
