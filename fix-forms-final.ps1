$root = 'E:\Documents\Empresa\site\Site Oficial\Site Oficial Ajustado EM USO'
$files = Get-ChildItem -Path $root -Filter '*.html' -Recurse

foreach ($file in $files) {
    $text = [System.IO.File]::ReadAllText($file.FullName)
    $matches = [regex]::Matches($text, '(?is)<form\b.*?</form>')
    if ($matches.Count -eq 0) { continue }

    $builder = New-Object System.Text.StringBuilder
    $lastIndex = 0

    for ($i = 0; $i -lt $matches.Count; $i++) {
        $match = $matches[$i]
        $block = $match.Value
        $prefix = if ($i -eq 0) { 'contact' } elseif ($i -eq 1) { 'footer-contact' } else { "contact-$($i + 1)" }

        $replacements = @(
            @{ old = 'id="name"'; new = "id=`"$prefix-name`"" },
            @{ old = 'id="email"'; new = "id=`"$prefix-email`"" },
            @{ old = 'id="subject"'; new = "id=`"$prefix-subject`"" },
            @{ old = 'id="message"'; new = "id=`"$prefix-message`"" },
            @{ old = 'id="form-submit"'; new = "id=`"$prefix-submit`"" },
            @{ old = 'id="footer-name"'; new = "id=`"$prefix-name`"" },
            @{ old = 'id="footer-email"'; new = "id=`"$prefix-email`"" },
            @{ old = 'id="footer-subject"'; new = "id=`"$prefix-subject`"" },
            @{ old = 'id="footer-message"'; new = "id=`"$prefix-message`"" },
            @{ old = 'id="footer-submit"'; new = "id=`"$prefix-submit`"" },
            @{ old = 'id="contact-name"'; new = "id=`"$prefix-name`"" },
            @{ old = 'id="contact-email"'; new = "id=`"$prefix-email`"" },
            @{ old = 'id="contact-subject"'; new = "id=`"$prefix-subject`"" },
            @{ old = 'id="contact-message"'; new = "id=`"$prefix-message`"" },
            @{ old = 'id="contact-submit"'; new = "id=`"$prefix-submit`"" },
            @{ old = 'id="footer-contact-name"'; new = "id=`"$prefix-name`"" },
            @{ old = 'id="footer-contact-email"'; new = "id=`"$prefix-email`"" },
            @{ old = 'id="footer-contact-subject"'; new = "id=`"$prefix-subject`"" },
            @{ old = 'id="footer-contact-message"'; new = "id=`"$prefix-message`"" },
            @{ old = 'id="footer-contact-submit"'; new = "id=`"$prefix-submit`"" }
        )

        foreach ($entry in $replacements) {
            $block = $block.Replace($entry.old, $entry.new)
        }

        [void]$builder.Append($text.Substring($lastIndex, $match.Index - $lastIndex))
        [void]$builder.Append($block)
        $lastIndex = $match.Index + $match.Length
    }

    [void]$builder.Append($text.Substring($lastIndex))
    [System.IO.File]::WriteAllText($file.FullName, $builder.ToString())
}

$bad = @()
foreach ($file in $files) {
    $text = [System.IO.File]::ReadAllText($file.FullName)
    $ids = [regex]::Matches($text, 'id="([^"]+)"') | ForEach-Object { $_.Groups[1].Value }
    $counts = @{}
    foreach ($id in $ids) {
        if (-not $counts.ContainsKey($id)) { $counts[$id] = 0 }
        $counts[$id]++
    }
    foreach ($entry in $counts.GetEnumerator()) {
        if ($entry.Value -gt 1) {
            $bad += [pscustomobject]@{ File = $file.FullName; ID = $entry.Key; Count = $entry.Value }
        }
    }
}

if ($bad.Count -gt 0) {
    $bad | Format-Table -AutoSize
    exit 1
}

Write-Output 'NO_DUPLICATE_IDS_FOUND'
Write-Output ('HTML_FILES=' + ($files.Count))
